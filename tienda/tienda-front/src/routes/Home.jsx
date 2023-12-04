import ledgerProductsImage from "../assets/images/home-img.png";

const Home = () => {
  return (
    <div className="bg-brandOne min-h-screen w-full">
      <img
        src={ledgerProductsImage}
        alt="LedgerProducts"
        className="w-full h-auto"
      />
    </div>
  );
};

export default Home;
