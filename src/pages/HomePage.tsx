import { NavBar } from '@/components/partials/NavBar'
import { useAppSelector, type RootState } from '@/store'

const HomePage = () => {
    const {user} = useAppSelector((state: RootState) => state.auth);
  return (
    <div className="flex flex-col w-full">
        <NavBar user={user} page='dashboard'/>
    </div>
  )
}

export default HomePage