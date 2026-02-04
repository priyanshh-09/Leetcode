import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const signupSchema = z.object({
    emailId:z.string().email("Invalid Email"),
    password:z.string().min(8,"Password must Match")
})

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({resolver:zodResolver(signupSchema)});

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="card w-96 max-w-md shadow-xl bg-base-100">
        <div className="card-body">
        
          <h2 className="card-title text-3xl justify-center">Login</h2>

          <p className="text-center text-sm text-gray-500">
            login to get started
          </p>

          <form
            onSubmit={handleSubmit((data) => console.log(data))}
            className="flex flex-col gap-4 mt-4"
          >
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
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );

}

