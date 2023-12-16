import { useNavigate } from 'react-router-dom';
import storeLandingImage from '../assets/images/store-landing.png';
import { useState } from 'react';

const Store = () => {
    const navigate = useNavigate();
    const [showLearnMore, setShowLearnMore] = useState(false);

    const handleLearnMore = () => {
        setShowLearnMore(!showLearnMore);
    };

    return (
        <main className="relative bg-white">
            {/* Header */}
            <header className="z-30 flex items-center w-full h-24">
                {/* Logotipo y navegación */}
            </header>

            {/* Sección Principal */}
            <div className="flex items-center bg-white">
                <div className="container flex flex-col items-center px-6 py-8 mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-4xl font-light uppercase sm:text-5xl">
                            Secure Shopping Experience
                        </h1>
                        <h2 className="py-8 mx-auto text-xl font-light">
                            Join our secure and innovative shopping platform, powered by Hyperledger Fabric.
                        </h2>
                        <div className="flex items-center justify-center mt-4">
                            <button onClick={() => navigate('/store/login')} className="px-4 py-2 mr-4 uppercase bg-gray-800 border-2 border-transparent text-md text-white hover:bg-gray-900">
                                Join Now
                            </button>
                            <button onClick={handleLearnMore} className="px-4 py-2 uppercase bg-transparent border-2 border-gray-800 hover:bg-gray-800 hover:text-white text-md text-gray-800">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Learn More Message */}
            {showLearnMore && (
                <div className="w-full bg-black text-white p-4">
                    <p className="text-center">
                        Hyperledger Fabric is a cutting-edge blockchain framework that enhances security and privacy for all participants. Our store leverages this technology to provide a safe, transparent, and efficient shopping experience.
                    </p>
                </div>
            )}
            
            <img src={storeLandingImage} alt="Store Landing" className="w-auto w-full mt-6 mx-auto" style={{ maxWidth: '1080px' }}/>

            {/* Sección de Productos */}
            <section className="py-8">
                {/* Tarjetas de productos o contenido relevante */}
            </section>

            {/* Footer */}
            {/* <footer className="container mx-auto py-8 border-t border-gray-400">
            </footer> */}
        </main>
    );
};

export default Store;
