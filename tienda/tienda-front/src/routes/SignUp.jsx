import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import metamaskLogo from '../assets/logo/metamask-fox.svg';
import { createJWT } from '../hooks/jwtAuth';
import { signUp, verifyAddressAuthority } from '../utils/hlfApi/signUp';

const SignUp = ({ userType }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    walletAddress: '',
    // password: '',
    repeatPassword: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (formData.password !== formData.repeatPassword) {
    //   setError('Passwords do not match');
    //   return;
    // }
    if (!formData.walletAddress) {
      setError('You need to provide an address with Metamask')
      return
    }
    
    const tokenResponse = await verifyAddressAuthority(userType, formData);
    if (tokenResponse.error) {
      setError(tokenResponse.error);
      return;
    }
    
    const signedToken = await createJWT(formData.walletAddress, tokenResponse.token);
    if (!signedToken) {
      setError('Error signing token with Metamask');
      return;
    }

    // Verificar firma del token con el servidor
    const result = await signUp(userType, formData, signedToken);
    if (result && result.error) {
      setError(result.error);
      return;
    }

    if (result && result.error === null) {
        const filterNavigate = userType === 'client' ? navigate('/store/login') : navigate('/business/login')
        
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Limpiar el error al cambiar los datos
  };

  const handleMetamaskConnection = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    try {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      setFormData({ ...formData, walletAddress: accounts[0] });
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
    }
  };

  return (
    <section className="">
      <div className="flex flex-col items-center justify-start px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-[#EBE9E3]">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Register for an account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              {/* Username */}
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">Your username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
                  required
                />
              </div>
              {/* Metamask Connection */}
              <div className="mb-4">
                <label htmlFor="walletAddress" className="block mb-2 text-sm font-medium text-gray-900">
                  Public Address *
                </label>
                <div className="flex flex-col">
                 <input
                   type="text"
                   id="walletAddress"
                   name="walletAddress"
                   value={formData.walletAddress}
                   onChange={handleChange}
                   className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5 mb-2"
                   readOnly/>
                 <button
                   type="button"
                   onClick={handleMetamaskConnection}
                   className="bg-white border border-gray-300 rounded-lg p-2.5 flex justify-center items-center">
                   <img src={metamaskLogo} alt="Metamask" className="h-6 mr-2" />
                   <span className="text-gray-600 font-bold">Connect with Metamask</span>
                 </button>
                </div>
              </div>
              {/* Password */}
              {/* <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
                  required
                />
              </div> */}
              {/* Repeat Password */}
              {/* <div>
                <label htmlFor="repeatPassword" className="block mb-2 text-sm font-medium text-gray-900">Repeat password *</label>
                <input
                  type="password"
                  id="repeatPassword"
                  name="repeatPassword"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
                  required
                />
              </div> */}
              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-brandOne block w-full p-2.5"
                  required
                />
              </div>
              {/* Error Message */}
              {error && <p className="text-red-500 text-center mt-4">{error.message || error}</p>}
              {/* Submit Button */}
              <button type="submit" className="w-full text-brandTwo bg-brandOne hover:bg-brandTwo hover:text-white focus:ring-4 focus:outline-none focus:ring-brandOne font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                REGISTER
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;