import { useContext, useState, useEffect } from "react";
import React from "react"
import AuthContext from "../../context/AuthContext";
import { getMyInvoiceClient } from "../../utils/hlfApi/chaincode/Client/getMyInvoiceClient";
import { getInvoiceDetailList } from "../../utils/hlfApi/Invoices/getInvoiceDetailList";
import { formatPrice } from "../../utils/functions/formatPrice";
import LoadingCard from "../../components/LoadingCard";
import clientProfilePic from "../../assets/images/clientprofile.png"

const Invoices = () => {
  const { authState, token, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState(null);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const invoiceList = await getMyInvoiceClient(token);
        setInvoices(invoiceList);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

//   const handleInvoiceDetail = async (invoiceNumber) => {
//     try {
//       const invoiceNumberToString = invoiceNumber.toString();
//       const details = await getInvoiceDetailList(invoiceNumberToString, token);
//       setInvoiceDetails((prevDetails) => ({
//         ...prevDetails,
//         [invoiceNumber]: details,
//       }));
//     } catch (error) {
//       console.error("Error fetching invoice details:", error);
//     }
//     setIsModalOpen(true);
//     setSelectedInvoiceNumber(invoiceNumber);
//   };

  const handleInvoiceDetailToggle = async (invoiceNumber) => {
    if (selectedInvoiceNumber === invoiceNumber) {
      // Close the current dropdown
      setSelectedInvoiceNumber(null);
    } else {
      // Open a new dropdown and fetch details if not already loaded
      setSelectedInvoiceNumber(invoiceNumber);
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
    <section className="bg-brandOne min-h-screen w-full">
      <div className="font-sans h-screen w-full flex flex-col justify-center items-center">
        <div className="card w-96 mx-auto bg-white shadow-xl hover:shadow">
          <img
            className="w-32 mx-auto rounded-full -mt-20 border-8 border-white"
            src={clientProfilePic}
            alt=""
          />
          <div className="text-center mt-2 text-3xl font-medium">{user}</div>
          <div className="text-center mt-2 font-light text-sm"></div>
          <div className="text-center font-normal text-lg"></div>
          <div className="px-6 text-center mt-2 font-light text-sm">
            <p></p>
          </div>
          <hr className="mt-8" />
          <div className="flex p-4">
            <div className="w-1/2 text-center">
              <span className="font-bold">1.8k</span> Followers
            </div>
            <div className="w-0 border border-gray-300 my-auto mx-4">
              <span className="hidden">divider</span>
            </div>
            <div className="w-1/2 text-center">
              <span className="font-bold">2.0k</span> Following
            </div>
          </div>
        </div>

        {/* Aquí iría el componente de la tabla */}

        <div className="flex flex-col"> 
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8 shadow">
              <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                      <th scope="col" className="relative py-3.5 px-4">
                        Actions
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
                      onClick={() => handleInvoiceDetailToggle(invoice.invoiceNumber)}
                      aria-haspopup="true"
                      aria-expanded={selectedInvoiceNumber === invoice.invoiceNumber ? "true" : "false"}
                    >
                              View Details
                            </button>
                          </td>
                        </tr>
                        {selectedInvoiceNumber === invoice.invoiceNumber && (
                  <tr className="invoice-dropdown">
                    <td colSpan="5">
                      {/* Dropdown Content Here */}
                      <div className="relative">
                        <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg">
                          <div className="py-1">
                            {invoiceDetails[invoice.invoiceNumber] && invoiceDetails[invoice.invoiceNumber].map((detail, index) => (
                              <div key={index} className="px-4 py-2 text-sm text-gray-700">
                                {detail.name} - Quantity: {detail.quantity} - Price: {formatPrice(detail.price)}
                              </div>
                            ))}
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
        </div>
      </div>
      {/* Pagination component here if needed*/}
    </section>
  );
};

export default Invoices;
