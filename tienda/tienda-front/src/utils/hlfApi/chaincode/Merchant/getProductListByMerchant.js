import { readChaincode } from "../../transaction";

export const getProductListByMerchant = async (identity, verifyToken) => {
  const functionData = {
    fcn: "getProductListByMerchant",
    args: [`${identity}`],
  };

  return await readChaincode('business', functionData, verifyToken);
};