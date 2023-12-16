import { readChaincode } from "../../transaction";

export const getProductList = async (verifyToken) => {
  const functionData = {
    fcn: "getProductList",
    args: [],
  };

  return await readChaincode('client', functionData, verifyToken);
};