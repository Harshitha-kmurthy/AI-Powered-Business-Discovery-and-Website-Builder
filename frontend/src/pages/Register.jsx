import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";


function Register(){


    const navigate = useNavigate();


    const [user,setUser] = useState({

        username:"",
        email:"",
        password:""

    });



    const handleChange = (e)=>{


        setUser({

            ...user,

            [e.target.name]: e.target.value

        });


    };




    const register = async()=>{


        try{


            await API.post(
                "/auth/register",
                user
            );


            alert("Registration successful");


            navigate("/login");


        }


        catch(error){


            alert(
                "Registration failed"
            );


        }


    };




    return (

        <div>


            <h1>
                Register
            </h1>



            <input

                name="username"

                placeholder="Username"

                onChange={handleChange}

            />



            <br />



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


            <button onClick={register}>

                Register

            </button>



        </div>

    );


}



export default Register;