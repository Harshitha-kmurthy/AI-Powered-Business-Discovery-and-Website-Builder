import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";



function Login(){


    const navigate = useNavigate();



    const [user,setUser] = useState({

        email:"",
        password:""

    });



    const handleChange=(e)=>{


        setUser({

            ...user,

            [e.target.name]:e.target.value

        });


    };




    const login = async()=>{


        try{


            const response = await API.post(

                "/auth/login",

                user

            );



            localStorage.setItem(

                "token",

                response.data.access_token

            );
            console.log(localStorage.getItem("token"));


            alert(
                "Login successful"
            );



            navigate("/dashboard");


        }



        catch(error){


            alert(
                "Invalid email or password"
            );


        }


    };




    return (

        <div>


            <h1>
                Login
            </h1>



            <input


                name="email"

                placeholder="Email"

                onChange={handleChange}


            />



            <br />



            <input


                name="password"

                type="password"

                placeholder="Password"

                onChange={handleChange}


            />


            <br />



            <button onClick={login}>

                Login

            </button>



        </div>


    );


}



export default Login;