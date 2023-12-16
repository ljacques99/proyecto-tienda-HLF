import { writeChaincode } from "../../transaction";

export const addMerchant = async (name, verifyToken) => {
  const functionData = {
    fcn: "addMerchant",
    args: [`${name}`],
  };

  return await writeChaincode('business', functionData, verifyToken);
};