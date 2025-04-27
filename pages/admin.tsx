import useAuthToken from "@/hooks/useAuthToken";
import { useEffect, useState } from "react";

const Admin = () => {
  const [orgName, setOrgName] = useState("");
  const token = useAuthToken();
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: "", lng: "" });
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedPassword = sessionStorage.getItem("adminPassword");
    if (storedPassword) {
      setPassword(storedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Jirik2308") {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminPassword", password);
    } else {
      setMessage("Incorrect password");
    }
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    const organizationData = {
      name: orgName,
      regionId: parseInt(selectedRegion),
      gps: gpsCoordinates,
      postalCode,
      street,
      city,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API}api/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(organizationData),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Organization added successfully!");
      setOrgName("");
      setSelectedRegion("");
      setGpsCoordinates({ lat: "", lng: "" });
      setPostalCode("");
      setStreet("");
      setCity("");
    } else {
      setMessage(data.message || "Failed to add organization.");
    }
  };

  return (
    <main className="flex flex-col items-center flex-grow !pt-safe !px-safe pb-safe overflow-auto">
      <div className="flex flex-col items-center w-full max-w-md"> 

        {!isAuthenticated ? (
          <>
            <h1 className="text-2xl font-bold mb-6">Administrace</h1>
            <form
              onSubmit={handleLogin}
              className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
            >
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Login
              </button>
            </form>
            {message && <p className="mt-4 text-red-500">{message}</p>}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Administrace</h1>
            <form
              onSubmit={handleAddOrganization}
              className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
            >
              <input
                type="text"
                placeholder="Jméno organizace"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="GPS šířka"
                value={gpsCoordinates.lat}
                onChange={(e) =>
                  setGpsCoordinates({ ...gpsCoordinates, lat: e.target.value })
                }
                required
                className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="GPS délka"
                value={gpsCoordinates.lng}
                onChange={(e) =>
                  setGpsCoordinates({ ...gpsCoordinates, lng: e.target.value })
                }
                required
                className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="Ulice"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="Město"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="PSČ"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Add Organization
              </button>
            </form>
            {message && <p className="mt-4 text-red-500">{message}</p>}
          </>
        )}
      </div>
    </main>
  );
};

export default Admin;
