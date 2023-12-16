import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import metamaskLogo from '../assets/logo/metamask-fox.svg';


const Login = ({ userType }) => {

  const navigate = useNavigate();
  const { login, loginWithWallet, error } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);

    if (result === true) {
      const filterNavigate = userType === 'client' ? navigate('/store/login') : navigate('/business/login')
    }
  };
  const handleWalletSubmit = async () => {
    const result = await loginWithWallet(userType);

    if (result === true) {
      const filterNavigate = userType === 'client' ? navigate('/store') : navigate('/business')
    }
  };

  return (
    <section className="">
      <div className="flex flex-col items-center justify-start px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-brandOne">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>
  
            {/* Sign in with Metamask */}
            <a className="flex items-center justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100">
              <div className="px-4 py-3">
                <img src={metamaskLogo} alt="Metamask Logo" className="h-6 w-6" />
              </div>
              <button className="px-4 py-3 w-5/6 text-center text-gray-600 font-bold" onClick={() => handleWalletSubmit()}>
                Sign in with Metamask
              </button>
            </a>
  
            <div className="mt-4 flex items-center justify-between">
              <span className="border-b w-1/5 lg:w-1/4"></span>
              <a className="text-xs text-center text-gray-500 uppercase">or login with email</a>
              <span className="border-b w-1/5 lg:w-1/4"></span>
            </div>
  
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">Your username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
                    placeholder="Username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
                    required
                  />
                </div>
                <button type="submit" className="w-full text-brandTwo bg-brandOne hover:bg-brandTwo hover:text-white focus:ring-4 focus:outline-none focus:ring-brandOne font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                  SIGN IN
                </button>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
              </form>
  
            {/* OR SIGN UP */}
            <div className="mt-4 flex items-center justify-between">
              <span className="border-b w-1/5 md:w-1/4"></span>
              <a href="signup" className="text-xs text-gray-500 uppercase">or sign up</a>
              <span className="border-b w-1/5 md:w-1/4"></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;

