import { signIn } from "next-auth/react";
import Image from "next/image";

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="min-w-290 absolute top-1/4 rounded-md border bg-white py-16 px-8 shadow-sm sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <Image
            className="mx-auto h-12 w-auto"
            src="https://www.cldproyectos.com/uploads/9/0/2/9/90290087/published/cld-logo-curvas_1.png?1496940059"
            alt="CLD"
            height="36,75"
            width="100,5"
          />
          <h2 className="mt-6 text-center text-2xl tracking-tight text-gray-900">Rendiciones</h2>
        </div>
        <div className="m-auto mt-4 w-3/4 rounded-md shadow-sm">
          <button
            type="submit"
            className="group relative w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => signIn("google", { callbackUrl: "http://localhost:3000/" })}
          >
            Iniciar sesion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
