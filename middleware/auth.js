const jwt = require('jsonwebtoken');

const auth = async(req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const role = req.headers.role.split(" ")[1];
        let decodedData;
        
        
        // console.log(role);
        
        if(token){
            if(role === "manager"){
                decodedData = jwt.verify(token, 'test-manager');
                req.userID = decodedData?.id;
                
                next();    
            }else if(role === "employee"){
                decodedData = jwt.verify(token, 'test');
                req.userID = decodedData?.id;
        
                next();
            }
        }


    }catch(err){
        console.log(err);
        res.send(err);
    }
}

module.exports = auth;