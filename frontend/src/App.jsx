import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BusinessDetails from "./pages/BusinessDetails";


import ProtectedRoute from "./components/ProtectedRoute";
import WebsiteBuilder from "./pages/WebsiteBuilder";




function App() {


  return (


    <BrowserRouter>


      <Routes>



        <Route

        path="/"

        element={<Login />}

        />



        <Route

        path="/register"

        element={<Register />}

        />



        <Route

        path="/login"

        element={<Login />}

        />



<Route
    path="/website-builder"
    element={
        <ProtectedRoute>
            <WebsiteBuilder />
        </ProtectedRoute>
    }
/>

        <Route


        path="/dashboard"


        element={


          <ProtectedRoute>


              <Dashboard />


          </ProtectedRoute>


        }


        />







        <Route


        path="/business/:id"


        element={


          <ProtectedRoute>


              <BusinessDetails />


          </ProtectedRoute>


        }


        />





      </Routes>



    </BrowserRouter>


  );


}


export default App;