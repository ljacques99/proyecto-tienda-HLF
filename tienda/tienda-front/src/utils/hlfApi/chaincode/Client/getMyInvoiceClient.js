import { readChaincode } from "../../transaction";

export const getMyInvoiceClient = async (verifyToken) => {
  const functionData = {
    fcn: "getMyInvoiceClient",
    args: [],
  };

  return await readChaincode('client', functionData, verifyToken);
};