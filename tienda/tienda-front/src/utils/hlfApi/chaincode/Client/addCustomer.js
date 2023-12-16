import { writeChaincode } from "../../transaction";

export const addCustomer = async (verifyToken) => {
  const functionData = {
    fcn: "addCustomer",
    args: [],
  };

  return await writeChaincode('client', functionData, verifyToken);
};