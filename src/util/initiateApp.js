import { dbConnection } from "../../DB/dbConnection.js";
import { config } from "dotenv";
import path from "path";
import * as allRouters from "./allRouters.js";
import { globalResponse } from "./errorAsyncHandler.js";
import { changeCouponsStatusCorn } from "./crons.js";
import cors from 'cors'
export const initiateApp = (app, express) => {
  const port = process.env.PORT;

  app.use(express.json());
  dbConnection();
  app.use(cors()) // allow anyone 
  app.use("/category", allRouters.categoryRouter);
  app.use("/subCategory", allRouters.subCategoryRouter);
  app.use("/brand", allRouters.brandsRouter);
  app.use("/product", allRouters.productRouter);
  app.use("/coupon", allRouters.couponRouter);
  app.use("/auth", allRouters.authRouter);
  app.use("/coupon", allRouters.couponRouter)
  app.use("/cart",allRouters.cartRouter)
  app.use("/order",allRouters.orderRouter)
  app.all("*", (req, res, next) =>
    res.status(404).json({ message: "404 Not Found URL" })
  );
  app.use(globalResponse);
  //uncomment to allow corn operation to  run
  //changeCouponsStatusCorn();
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
