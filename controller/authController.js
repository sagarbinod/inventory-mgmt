const userModel = require('../model/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ldap = require('ldapjs');
const callAPI = require('../config/apims');

const registerUser = async (req, res) => {
  console.log("Inside register User");
  console.log(req.body);
  try {
    const user = await userModel.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
};

const loginUser = async (req, res) => {
  console.log(req.body)
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      console.log(user);
      const isValidPassword = await bcrypt.compare(req.body.password, user.password);
      console.log(isValidPassword);
      if (isValidPassword) {
        console.log("password is valid");
        const accessToken = jwt.sign(
          { id: user._id, isAdmin: user.isAdmin },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        const { password, ...rest } = user._doc;
        res.cookie("jwt", accessToken);
        res.json({ ...rest, accessToken });
      } else {
        res.status(401).json("Password is incorrect");
      }
    } else {
      res.status(401).json("Email is incorrect");
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err })
  }
}

const adLoginUser = (req, res) => {
  //console.log(req.query);
  const { username, password } = req.body;
  const domainName = username + '@CTZNBANK.COM';
  console.log(`username: ${username}, domainName: ${domainName}, password:${password} `);
  const client = ldap.createClient({
    url: process.env.LDAP_URL
  });

  client.bind(domainName, password, (err) => {
    if (err) {
      res.status(200).send({ "status": "failed", "message": "invalid credentials" });
    } else {
      //GET THE EMPLOYEE DETAIL BASED ON DOMAIN NAME WHILE AUTHENTICATING
      const functionName = process.env.EMP_DETAIL_BY_DOMAIN;
      const requestModel = { "domainUserName": `${username}` };

      async function fetchData() {
        const empDetail = await callAPI(functionName, requestModel);
        console.log(empDetail);
        if (empDetail) {
          const accessToken = jwt.sign(
            { "data": empDetail },
            process.env.JWT_SECRET,
            { "expiresIn": "1d" });
          empDetail.Data.token = accessToken;
          res.status(200).json(empDetail);
        } else {
          res.status(401).send("Authentication Failed");
        }
      };
      fetchData();

      /*
      async function fetchData() {
        const empDetail = {
          "Code": "0",
          "Data": {
            "branchManagerDesignation": "",
            "branchManagerName": "",
            "branchType": "Inside Valley",
            "departmentName": "Information Technology Department",
            "designation": "Supervisor",
            "domainUserName": "sunil.gurung",
            "email": "sunil.gurung@ctznbank.com",
            "employeeId": "1923",
            "employeeName": "Sunil Gurung",
            "functionalTitle": "",
            "isProvinceManager": "N",
            "phone": "9840021160",
            "solDesc": "Corporate Office",
            "solId": "999"
          },
          "DeveloperMessage": null,
          "Errors": null,
          "Message": "Operation Successfull"
        };
        if (empDetail) {
          const accessToken = jwt.sign(
            { "data": empDetail },
            process.env.JWT_SECRET,
            { "expiresIn": "1d" });
          empDetail.Data.token = accessToken;
          res.status(200).json(empDetail);
        } else {
          res.status(401).send("Authentication Failed");
        }
      };
      */

    }
    client.unbind();
  });
}


module.exports = { registerUser, loginUser, adLoginUser };