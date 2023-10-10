import { Router } from "express";
import { asyncHandler } from './../../util/errorAsyncHandler.js';
import * as ac from "./auth.controller.js"
const router = Router();
router.post('/signUp', asyncHandler(ac.signUp))
router.get('/confirm/:token', asyncHandler(ac.confirmEmail))
router.post('/signIn', asyncHandler(ac.signIn))
router.post('/forgetPassword', asyncHandler(ac.forgetPassword))
router.post('/reset/:token', asyncHandler(ac.restPassword))
export default router