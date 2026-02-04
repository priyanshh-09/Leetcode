import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z, { email } from "zod";

const signupSchema = z.object({
    firstName:z.string().min(3,"Name should contain atleast 3 chars"),
    emailId:z.string().email("Invalid Email"),
    password:z.string().min(8,"Password must have atleast 8 chars")
})

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({resolver:zodResolver(signupSchema)});

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="card w-96 max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-3xl justify-center">Create Account</h2>
          <p className="text-center text-sm text-gray-500">
            Sign up to get started
          </p>

          <form
            onSubmit={handleSubmit((data) => console.log(data))}
            className="flex flex-col gap-4 mt-4"
          >
            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                {...register("firstName")}
                type="text"
                placeholder="John Doe"
                className="input input-bordered"
              />
              {errors.firstName && (
                <span className="text-error text-sm mt-1">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                {...register("emailId")}
                type="email"
                placeholder="john@email.com"
                className="input input-bordered"
              />
              {errors.emailId && (
                <span className="text-error text-sm mt-1">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="input input-bordered"
              />
              {errors.password && (
                <span className="text-error text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary mt-4">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );

}
