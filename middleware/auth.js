const jwt = require('jsonwebtoken');

const auth = async(req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        // console.log(token);
        let decodedData;

        if(token){
            decodedData = jwt.verify(token, 'test');
            req.userID = decodedData?.id;
            // console.log(decodedData.id);
        }
        next();

    }catch(err){
        console.log(err);
        res.send(err);
    }
}

module.exports = auth;