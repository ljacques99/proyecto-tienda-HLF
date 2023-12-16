import { readChaincode } from "../../transaction";

export const getMyInvoiceMerchant = async (verifyToken) => {
  const functionData = {
    fcn: "getMyInvoiceMerchant",
    args: [],
  };

  return await readChaincode('business', functionData, verifyToken);
};