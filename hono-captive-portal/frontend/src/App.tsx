import { Button } from "./components/ui/button"

function App() {

  // const loginURL = "https://gateway.pluxnet.co.za/login"
  const loginURL = "http://charles.hotspot/login"
  const username = "mahmut1"
  const password = "1234"

  return (
    <>
      {/* <h1 className="text-3xl font-bold">Yessss</h1> */}
      <h1>Hellooo thereee</h1>

      <form action={`${loginURL}?username=${username}&password=${password}`} method="get">
        <input type="text" name="username" placeholder="Username" value={username} />
        <input type="text" name="password" placeholder="Password" value={password} />
        <Button type="submit">Login</Button>
      </form>

      {/* <LoginPage /> */}
    </>
  )
}

export default App
