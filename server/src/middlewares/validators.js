import { body, query, validationResult } from "express-validator"


export const validateLogin = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required").bail()
        .isEmail().withMessage("Invalid email"),
    body("password")
        .notEmpty().withMessage("Password is required"),
]

export const validateRegister =[
    body("firstname")
    .trim()
    .notEmpty().withMessage("Firstname is required")
    .isLength({max: 20}).withMessage("Firstname must be 20 characters max"),
    body("lastname")
    .trim()
    .notEmpty().withMessage("Lastname is required")
    .isLength({max: 20}).withMessage("Lastname must be 20 characters max"),
    body("email")
    .trim()
    .notEmpty().withMessage("Email is required").bail()
    .isEmail().withMessage("Invalid email"),
body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({min: 7}).withMessage("Password must be at least 7 characters"),
body("confirmPassword")
    .notEmpty().withMessage("confirmPassword is required")
    .custom((value, {req}) => value === req.body.password ).withMessage("Passwords do not match"),
]

export const validateUpdateMe =[
    body("firstname")
        .optional()
        .trim()
        .notEmpty().withMessage("Firstname cannot be empty")
        .isLength({max: 20}).withMessage("Firstname must be 20 characters max"),
    body("lastname")
        .optional()
        .trim()
        .notEmpty().withMessage("Lastname cannot be empty")
        .isLength({max: 20}).withMessage("Lastname must be 20 characters max"),
]

export const validateUpdatePassword = [
    body("currentPassword")
    .notEmpty().withMessage("Current password is required"),
    body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({min: 7}).withMessage("Password must be at least 7 characters"),
    body("confirmNewPassword")
    .notEmpty().withMessage("confirmPassword is required")
    .custom((value, {req}) => value === req.body.newPassword ).withMessage("Passwords do not match"),   
]

export const validateUpdateEmail = [
    body("email")
    .trim()
    .notEmpty().withMessage("Email is required").bail()
    .isEmail().withMessage("Invalid email"),
    body("currentPassword")
    .notEmpty().withMessage("Current password is required"),
]


export const validateFriendRequest = [
    body("receiverId")
    .trim()
    .isInt({min: 1}).withMessage("Receiver id must be an integer")
    .toInt()
]

export const validateFriendRequestsQuery = [
    query("type")
    .optional()
    .trim()
    .isIn(["sent","received"]).withMessage("type must be sent or received")
]

export const validateFriendRequestAnswer = [
    body("status")
    .trim()
    .isIn(["ACCEPTED","DECLINED"]).withMessage("status must be ACCEPTED or DECLINED")
]


// -----------
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}