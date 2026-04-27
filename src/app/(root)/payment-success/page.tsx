import PaymentSuccessClient from "./_components/PamentSuccessClient"

interface Props {
  searchParams: {
    reference?: string
    orderId?: string
  }
}

export default function Page({ searchParams }: Props) {
  const reference = searchParams.reference ?? null
  const orderId = searchParams.orderId ?? null

  return (
    <PaymentSuccessClient
      reference={reference}
      orderId={orderId}
    />
  )
}