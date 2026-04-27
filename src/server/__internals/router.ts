import { Context, Hono, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { MiddlewareHandler, Variables } from "hono/types";
import { StatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { Bindings } from "../env";
import { bodyParsingMiddleware, queryParsingMiddleware } from "./middleware";
import { MutationOperation, QueryOperation } from "./types";

type OperationType<I extends Record<string, unknown>, O> =
  | QueryOperation<I, O>
  | MutationOperation<I, O>;

export const router = <T extends Record<string, OperationType<any, any>>>(
  obj: T
) => {
  // Create a new Hono instance with error handling
  const route = new Hono<{ Bindings: Bindings; Variables: any }>().onError(
    (err, c) => {
      // Handle HTTPExceptions (expected errors)
      if (err instanceof HTTPException) {
        return c.json(
          {
            error: "Server Error",
            message: err.message,
            type: "HTTPException",
          },
          err.status
        );
      } else {
        // Handle unexpected errors
        return c.json(
          {
            error: "Unknown Error",
            message: "An unexpected error occurred",
            type: "UnknownError",
          },
          500
        );
      }
    }
  );

  // Loop through each operation in the router object (e.g., getPosts, createPost)
  Object.entries(obj).forEach(([key, operation]) => {
    // Define the route path (e.g., "/getPosts", "/createPost")
    const path = `/${key}`;

    // Process middlewares for this operation
    const operationMiddlewares: MiddlewareHandler[] = operation.middlewares.map(
      (middleware) => {
        // Wrap each middleware to handle context passing
        const wrapperFunction = async (c: Context, next: Next) => {
          // Get existing context or initialize empty object
          const ctx = c.get("__middleware_output") ?? {};

          // Create a next function that saves middleware output
          const nextWrapper = <B>(args: B) => {
            c.set("__middleware_output", { ...ctx, ...args });
            return { ...ctx, ...args };
          };

          // Run the middleware
          const res = await middleware({ ctx, next: nextWrapper, c });
          
          // Save the middleware's return value to context
          c.set("__middleware_output", { ...ctx, ...res });

          await next();
        };

        return wrapperFunction;
      }
    );

    // Handle QUERY operations (GET requests)
    if (operation.type === "query") {
      // If the operation has a schema (expects input parameters)
      if (operation.schema) {
        // Register a GET route with the path
        route.get(
          path,
          queryParsingMiddleware,      // Parse query parameters
          ...operationMiddlewares,      // Run all middlewares
          async (c) => {                // Final handler
            // Get context from middlewares
            const ctx = c.get("__middleware_output") || {};
            // Get parsed query parameters
            const parsedQuery = c.get("parsedQuery");

            let input;
            try {
              // Validate the query parameters against the schema
              input = operation.schema?.parse(parsedQuery);
            } catch (err) {
              // If validation fails, throw a 400 error
              if (err instanceof ZodError) {
                throw new HTTPException(400, {
                  cause: err,
                  message: err.message,
                });
              } else {
                throw err;
              }
            }

            // Call the actual operation handler (e.g., your getPost function)
            const result = await operation.handler({ c, ctx, input });
            
            // FIX: Cast to any to bypass TypeScript check
            // Your handler returns a valid Response (via c.superjson() or c.json())
            return result as any;
          }
        );
      } else {
        // For queries WITHOUT schema (no input parameters)
        route.get(path as any, ...operationMiddlewares, async (c) => {
          const ctx = c.get("__middleware_output") || {};
          
          // Call handler with undefined input
          const result = await operation.handler({ c, ctx, input: undefined });
          
          // Return the result directly (already working correctly)
          return result as any;
        });
      }
    } 
    // Handle MUTATION operations (POST requests)
    else if (operation.type === "mutation") {
      if (operation.schema) {
        route.post(
          path,
          bodyParsingMiddleware,       // Parse request body
          ...operationMiddlewares,
          async (c) => {
            const ctx = c.get("__middleware_output") || {};
            const parsedBody = c.get("parsedBody");

            let input;
            try {
              // Validate the request body
              input = operation.schema?.parse(parsedBody);
            } catch (err) {
              if (err instanceof ZodError) {
                throw new HTTPException(400, {
                  cause: err,
                  message: err.message,
                });
              } else {
                throw err;
              }
            }

            const result = await operation.handler({ c, ctx, input });
            
            // For mutations, we keep c.json() because mutations typically
            // return plain objects, not Response objects
            return c.json(result);
          }
        );
      } else {
        route.post(path as any, ...operationMiddlewares, async (c) => {
          const ctx = c.get("__middleware_output") || {};
          const result = await operation.handler({ c, ctx, input: undefined });
          
          // Wrap in c.json() for consistency
          return c.json(result);
        });
      }
    }
  });

  // Type definitions for TypeScript support
  type InferInput<T> = T extends OperationType<infer I, any> ? I : {};
  type InferOutput<T> = T extends OperationType<any, infer I> ? I : {};

  // Return the configured route with proper types
  return route as Hono<
    { Bindings: Bindings; Variables: Variables },
    {
      [K in keyof T]: T[K] extends QueryOperation<any, any>
        ? {
            $get: {
              input: InferInput<T[K]>;
              output: InferOutput<T[K]>;
              outputFormat: "json";
              status: StatusCode;
            };
          }
        : {
            $post: {
              input: InferInput<T[K]>;
              output: InferOutput<T[K]>;
              outputFormat: "json";
              status: StatusCode;
            };
          };
    }
  >;
};