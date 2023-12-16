import { writeChaincode } from "../../transaction";

export const deleteProduct = async (productId, verifyToken) => {
  const functionData = {
    fcn: "deleteProduct",
    args: [`${productId}`],
  };

  return await writeChaincode('business', functionData, verifyToken);
};