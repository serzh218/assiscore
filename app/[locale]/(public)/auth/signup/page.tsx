import SignUpForm from './SignUpForm'

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <SignUpForm locale={locale} />
}
