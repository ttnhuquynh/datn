import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import { Navbar } from "./components/navbar/Navbar";
import Analytics from "./pages/analytics/Analytics";
import Rooms from "./pages/rooms/Rooms";
import MyBot from "./pages/mybot/MyBot";
import { Layout } from "./components/layout";

function App() {
	const { authUser } = useAuthContext();
	return (
		<div className='h-full flex flex-col items-center '>
			<Routes>
				{/* <Route path="/" element={authUser ?<MyBot /> : <Navigate to='/' />} /> */}
				<Route path="/" element={<Layout />} >
					<Route path="rooms/:id" element={authUser ? <Rooms /> : <Navigate to='/' />} />
					<Route path='analytics/:id' element={authUser ? <Analytics /> : <Navigate to='/' />} />
				</Route>
				<Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
				<Route path='/signup' element={authUser ? <Navigate to='/' /> : <SignUp />} />
				{/* <Route path='/analytics/:id' element={authUser ? <Analytics /> : <Navigate to='/' />} /> */}
				{/* <Route path='/rooms/:id' element={authUser ? <Rooms /> : <Navigate to='/' />} /> */}
				<Route path="/mention" element={<p>hi</p>} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
