import { BrowserRouter } from "react-router-dom"
import AppRoutes from "@/routes/AppRoutes"
import { useEffect } from "react";
import { verifyUser } from "@/store/actions/auth/verifyUser";
import { useAppDispatch } from "@/hooks/useAppDispatch";


function App() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(verifyUser());
	}, [dispatch]);

	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	)
}

export default App
