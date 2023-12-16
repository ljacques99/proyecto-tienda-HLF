import { readChaincode } from "../../transaction";

export const getMerchant = async (identity, verifyToken) => {
  const functionData = {
    fcn: "getMerchant",
    args: [`${identity}`],
  };

  return await readChaincode('business', functionData, verifyToken);
};