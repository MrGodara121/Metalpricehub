import jwt from 'jsonwebtoken'

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'metalpricehub-secret-key')
  } catch (error) {
    return null
  }
}

export function authenticate(req) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}

export function authenticateAdmin(req) {
  const user = authenticate(req)
  if (!user || user.plan !== 'admin') return null
  return user
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwt.decode(token)
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser(decoded)
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = (token) => {
    localStorage.setItem('token', token)
    const decoded = jwt.decode(token)
    setUser(decoded)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return { user, loading, login, logout }
}
