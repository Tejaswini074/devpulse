// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).json({
//             message: 'No token provided'
//         });
//     }
//     const token = authHeader.startsWith('Bearer ')
//         ? authHeader.split(' ')[1]
//         : authHeader;

//     try {
//         const decoded = jwt.verify(
//             token, process.env.JWT_SECRET
//         );
//         req.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(401).json({
//             message: 'Invalid token'
//         });
//     }

// };

// module.exports = authMiddleware;


const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    console.log("Token:", token);

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            message: "Invalid token"
        });

    }

};

module.exports = authMiddleware;