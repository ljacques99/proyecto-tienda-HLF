import { writeChaincode } from "../../transaction";

export const addProduct = async (props, verifyToken) => {
  const functionData = {
    fcn: "addProduct",
    args: [props.id, props.name, props.price, props.imageURL],
  };

  return await writeChaincode('business', functionData, verifyToken);
};