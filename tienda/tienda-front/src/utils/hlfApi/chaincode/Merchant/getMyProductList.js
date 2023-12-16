import { readChaincode } from "../../transaction";

export const getMyProductList = async (verifyToken) => {
  const functionData = {
    fcn: "getMyProductList",
    args: [],
  };

  return await readChaincode('business', functionData, verifyToken);
};