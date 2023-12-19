import { useContext, useState, useEffect, useRef } from "react";
import React from "react"
import AuthContext from "../../context/AuthContext";
import { getMyInvoiceClient } from "../../utils/hlfApi/chaincode/Client/getMyInvoiceClient";
import { getInvoiceDetailList } from "../../utils/hlfApi/Invoices/getInvoiceDetailList";
import { formatPrice } from "../../utils/functions/formatPrice";
import LoadingCard from "../../components/LoadingCard";
import clientProfilePic from "../../assets/images/clientprofile.png"
import tokenLogo from "../../assets/logo/token.png"

const Invoices = () => {
  const { authState, token, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [profileInfo, setProfileInfo] = useState({})

  // Cambiar para manejar múltiples dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  // Almacenar referencias para todos los dropdowns
  const dropdownRefs = useRef({});

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const invoiceList = await getMyInvoiceClient(token);
        let totalSpent = 0;
        invoiceList.forEach((invoice) => {
         totalSpent += invoice.total;
        });
        setProfileInfo({ totalSpent });
        setInvoices(invoiceList);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

  const handleInvoiceDetailToggle = async (invoiceNumber) => {
    if (openDropdown === invoiceNumber) {
      // Close the current dropdown
      setOpenDropdown(null);
    } else {
      // Open a new dropdown and fetch details if not already loaded
      setOpenDropdown(invoiceNumber);
      if (!invoiceDetails[invoiceNumber]) {
        try {
          const invoiceNumberToString = invoiceNumber.toString();
          const details = await getInvoiceDetailList(invoiceNumberToString, token);
          setInvoiceDetails(prevDetails => ({
            ...prevDetails,
            [invoiceNumber]: details
          }));
        } catch (error) {
          console.error('Error fetching invoice details:', error);
        }
      }
    }
  };
  
  
  const handleClickOutside = (event) => {
    if (openDropdown !== null && dropdownRefs.current[openDropdown] && !dropdownRefs.current[openDropdown].contains(event.target)) {
      setOpenDropdown(null);
    }
  };

  // Efecto para escuchar clics fuera del menú desplegable
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  

  function extractMerchant(string) {
    const regex = /\/CN=([^:]+)::/;
    const matches = string.match(regex);
    if (matches && matches[1]) {
      return matches[1];
    } else {
      return string;
    }
  }

  if (isLoading) {
    // Mostrar tarjeta de carga
    return <LoadingCard className="min-h-screen w-full " />;
  }

  return (
    <section className="bg-brandOne min-h-screen w-full pt-16"> {/* pt-16 para dar espacio desde la parte superior, ajusta según la altura de tu NavBar */}
      <div className="font-sans w-full flex flex-col items-center gap-6"> {/* gap-6 para dar espacio entre las tarjetas */}
        
        {/* Tarjeta del Perfil */}
        <div className="card w-96 mx-auto bg-white shadow-xl rounded-lg p-4"> {/* rounded-lg y shadow-xl para bordes redondeados y sombra */}
          <img
            className="w-32 mx-auto rounded-full border-8 border-white"
            src={clientProfilePic}
            alt="Client Profile"
          />
          <h3 className="text-center mt-4 text-3xl font-medium">{user}</h3>
          <div className="text-center mt-4">
            Total Volume
          </div>
          <div className="text-center ">
            <span className="font-bold text-lg">{formatPrice(profileInfo.totalSpent)}</span>
            <img className="inline relative object-top w-5 h-5 ml-1 mt-[-3.5px]" src={tokenLogo} alt="token"/>
          </div>
        </div>
  
        {/* Tarjeta de la Tabla */}
        <div className="invoice-table-card w-5/6 mx-auto bg-white shadow-xl rounded-lg p-4"> {/* rounded-lg y shadow-xl para bordes redondeados y sombra */}
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 rounded-lg">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500"
                      >
                        Invoice #
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                      >
                        Merchant
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                      >
                        Total Amount
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice) => (
                        <React.Fragment key={invoice.invoiceNumber}>
                          <tr>
                            <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(invoice.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {extractMerchant(invoice.merchantId)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {formatPrice(invoice.total)}
                            </td>
                            <td className="px-4 py-4 text-sm whitespace-nowrap">
                              <button
                                onClick={() =>
                                  handleInvoiceDetailToggle(
                                    invoice.invoiceNumber
                                  )
                                }
                                aria-haspopup="true"
                                aria-expanded={openDropdown === invoice.invoiceNumber ? "true" : "false"}
                                className="text-white bg-brandTwo hover:bg-opacity-75 focus:ring-0 focus:outline-none focus:ring-brandTwo font-medium rounded-lg text-xs px-4 py-2"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                          {openDropdown === invoice.invoiceNumber && (
                            <tr className="invoice-dropdown" ref={el => dropdownRefs.current[invoice.invoiceNumber] = el}>
                              <td colSpan="5">
                                {/* Dropdown */}
                                <div className="relative">
                                  <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg">
                                    <div className="py-1">
                                      {invoiceDetails[invoice.invoiceNumber] ? (
                                        invoiceDetails[
                                          invoice.invoiceNumber
                                        ].map((detail, index) => (
                                          <div
                                            key={index}
                                            className="px-4 py-2 text-sm text-gray-700"
                                          >
                                            {detail.name} - Quantity:{" "}
                                            {detail.quantity} - Price:{" "}
                                            {formatPrice(detail.price)}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-center">
                                          <div role="status">
                                            <svg
                                              aria-hidden="true"
                                              className="inline w-8 h-8 text-gray-200 animate-spin fill-brandTwo"
                                              viewBox="0 0 100 101"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                              />
                                              <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                              />
                                            </svg>
                                            <span className="sr-only">
                                              Loading...
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Invoices;