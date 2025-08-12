import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="SignUp Dashboard"
        description="This is SignUp Tables Dashboard page "
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
