import express from "express";
import {config} from 'dotenv'
import path from "path";
import { initiateApp } from "./src/util/initiateApp.js";
config({ path: path.resolve("./config/config.env") });

/////////////////////////////////////////////////////////



const app= express(); // create the app
initiateApp(app, express); // this calls a function to initiate the server
