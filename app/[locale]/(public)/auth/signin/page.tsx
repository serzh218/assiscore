import SignInForm from './SignInForm'

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <SignInForm locale={locale} />
}
