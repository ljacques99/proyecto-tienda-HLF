import { readChaincode } from "../../transaction";

export const getCustomer = async (identity, verifyToken) => {
  const functionData = {
    fcn: "getCustomer",
    args: [`${identity}`],
  };

  return await readChaincode('client', functionData, verifyToken);
};