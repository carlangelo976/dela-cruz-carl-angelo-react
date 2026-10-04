import { useState } from "react";
import "./App.css";

const LAVALUST_URL = "https://dela-cruz-carl-angelo-lavalust.onrender.com";

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loginError, setLoginError] = useState("");
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("");

    const [showAdd, setShowAdd] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const [addProductName, setAddProductName] = useState("");
    const [addDescription, setAddDescription] = useState("");
    const [addPrice, setAddPrice] = useState("");
    const [addQuantity, setAddQuantity] = useState("");

    const [updateId, setUpdateId] = useState("");
    const [updateProductName, setUpdateProductName] = useState("");
    const [updateDescription, setUpdateDescription] = useState("");
    const [updatePrice, setUpdatePrice] = useState("");
    const [updateQuantity, setUpdateQuantity] = useState("");

    const [deleteId, setDeleteId] = useState("");

    // =====================================================
    // LOGIN
    // =====================================================

   async function handleLogin(e) {
    e.preventDefault();

    setLoginError("");
    setMessage("");

    if (!username || !password) {
        setLoginError("Please enter username and password.");
        return;
    }

    try {
        const response = await fetch(
            `${LAVALUST_URL}/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "text/html, application/json",
                },
                credentials: "include",
                body: new URLSearchParams({
                    username: username,
                    password: password,
                }),
            }
        );

        console.log("LOGIN STATUS:", response.status);
        console.log("LOGIN URL:", response.url);

        if (response.ok) {
            setLoggedIn(true);
            setMessage("Login successful.");
            await loadProducts();
        } else {
            const text = await response.text();
            console.log("LOGIN RESPONSE:", text);

            setLoginError(
                `Login failed. HTTP Status: ${response.status}`
            );
        }

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        setLoginError(
            "Cannot connect to LavaLust. Check if LavaLust server is running."
        );
    }
}
    // =====================================================
    // LOGOUT
    // =====================================================

    async function handleLogout() {
        try {
            await fetch(
                `${LAVALUST_URL}/logout`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
        } catch (error) {
            console.error(error);
        }

        setLoggedIn(false);
        setUsername("");
        setPassword("");
        setProducts([]);
        setMessage("");
    }

    // =====================================================
    // GET PRODUCTS
    // =====================================================

    async function loadProducts() {
    try {
        const response = await fetch(
            `${LAVALUST_URL}/api/products`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            }
        );

        const responseText = await response.text();

        console.log("GET STATUS:", response.status);
        console.log("GET URL:", response.url);
        console.log("GET RESPONSE:", responseText);

        if (!response.ok) {
            setMessage(
                `Unable to retrieve products. HTTP ${response.status}`
            );
            return;
        }

        const result = JSON.parse(responseText);

        if (result.data) {
            setProducts(result.data);
        } else {
            setProducts([]);
        }

    } catch (error) {
        console.error("GET ERROR:", error);

        setMessage(
            "Error loading products."
        );
    }
}

    // =====================================================
    // ADD PRODUCT
    // =====================================================

   async function addProduct() {
    try {
        const response = await fetch(
            `${LAVALUST_URL}/api/products`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    product_name: addProductName,
                    description: addDescription,
                    price: Number(addPrice),
                    quantity: Number(addQuantity),
                }),
            }
        );

        const responseText = await response.text();

        console.log("POST STATUS:", response.status);
        console.log("POST URL:", response.url);
        console.log("POST RESPONSE:", responseText);

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            result = null;
        }

        if (!response.ok) {
            setMessage(
                `Failed to add product. HTTP ${response.status}: ${responseText}`
            );
            return;
        }

        if (result?.status) {
            setMessage("Product added successfully.");

            setAddProductName("");
            setAddDescription("");
            setAddPrice("");
            setAddQuantity("");

            setShowAdd(false);

            await loadProducts();
        } else {
            setMessage(
                result?.message || "Failed to add product."
            );
        }

    } catch (error) {
        console.error("POST ERROR:", error);

        setMessage(
            "Cannot connect to LavaLust API."
        );
    }
}

    // =====================================================
    // UPDATE PRODUCT
    // =====================================================

    async function updateProduct() {
        if (!updateId) {
            setMessage(
                "Please enter Product ID."
            );
            return;
        }

        try {
            const response = await fetch(
                `${LAVALUST_URL}/api/products/${updateId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        product_name:
                            updateProductName,
                        description:
                            updateDescription,
                        price:
                            updatePrice,
                        quantity:
                            updateQuantity,
                    }),
                }
            );

            const result = await response.json();

            if (result.status) {
                setMessage(
                    "Product updated successfully."
                );

                setShowUpdate(false);

                await loadProducts();

            } else {
                setMessage(
                    result.message ||
                    "Failed to update product."
                );
            }

        } catch (error) {
            console.error("UPDATE ERROR:", error);

            setMessage(
                "Error updating product."
            );
        }
    }

    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    async function deleteProduct() {
        if (!deleteId) {
            setMessage(
                "Please enter Product ID."
            );
            return;
        }

        if (
            !window.confirm(
                `Are you sure you want to delete Product ID ${deleteId}?`
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `${LAVALUST_URL}/api/products/${deleteId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const result = await response.json();

            if (result.status) {
                setMessage(
                    "Product deleted successfully."
                );

                setDeleteId("");
                setShowDelete(false);

                await loadProducts();

            } else {
                setMessage(
                    result.message ||
                    "Failed to delete product."
                );
            }

        } catch (error) {
            console.error("DELETE ERROR:", error);

            setMessage(
                "Error deleting product."
            );
        }
    }

    // =====================================================
    // LOGIN PAGE
    // =====================================================

    if (!loggedIn) {
        return (
            <div className="login-page">

                <div className="login-card">

                    <h1>
                        Products API
                    </h1>

                    <p className="login-subtitle">
                        React Application
                    </p>

                    <div className="login-api-status">
                        LavaLust API Login
                    </div>

                    <form onSubmit={handleLogin}>

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter username"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter password"
                            />

                        </div>

                        {loginError && (
                            <div className="login-error">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-btn"
                        >
                            LOGIN
                        </button>

                    </form>

                    <p className="login-note">
                        Login using your LavaLust account.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // PRODUCTS PAGE
    // =====================================================

    return (
        <div className="page">

            <div className="container">

                <div className="top-bar">

                    <div>

                        <h1>
                            Products API
                        </h1>

                        <p className="subtitle">
                            React Application connected to LavaLust API
                        </p>

                    </div>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

                <div className="status">

                    API Status:

                    <span>
                        Connected
                    </span>

                </div>

                <div className="api-buttons">

                    <button
                        className="btn-get"
                        onClick={loadProducts}
                    >
                        GET
                    </button>

                    <button
                        className="btn-post"
                        onClick={() =>
                            setShowAdd(true)
                        }
                    >
                        POST
                    </button>

                    <button
                        className="btn-put"
                        onClick={() =>
                            setShowUpdate(true)
                        }
                    >
                        PUT/PATCH
                    </button>

                    <button
                        className="btn-delete"
                        onClick={() =>
                            setShowDelete(true)
                        }
                    >
                        DELETE
                    </button>

                </div>

                {message && (
                    <div className="message">
                        {message}
                    </div>
                )}

                <table>

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Created At</th>

                        </tr>

                    </thead>

                    <tbody>

                        {products.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="empty"
                                >
                                    No products found.
                                </td>

                            </tr>

                        ) : (

                            products.map(
                                (product) => (

                                    <tr
                                        key={
                                            product.id
                                        }
                                    >

                                        <td>
                                            {product.id}
                                        </td>

                                        <td>
                                            {
                                                product.product_name
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.description
                                            }
                                        </td>

                                        <td className="price">

                                            ₱
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "en-PH",
                                                {
                                                    minimumFractionDigits:
                                                        2,
                                                }
                                            )}

                                        </td>

                                        <td>
                                            {
                                                product.quantity
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.created_at
                                            }
                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>

            {/* =====================================================
                ADD MODAL
            ===================================================== */}

            {showAdd && (

                <div className="modal">

                    <div className="modal-content">

                        <h2>
                            POST – Add Product
                        </h2>

                        <div className="form-group">

                            <label>
                                Product Name
                            </label>

                            <input
                                type="text"
                                value={
                                    addProductName
                                }
                                onChange={(e) =>
                                    setAddProductName(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                value={
                                    addDescription
                                }
                                onChange={(e) =>
                                    setAddDescription(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Price
                            </label>

                            <input
                                type="number"
                                value={
                                    addPrice
                                }
                                onChange={(e) =>
                                    setAddPrice(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                value={
                                    addQuantity
                                }
                                onChange={(e) =>
                                    setAddQuantity(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="modal-buttons">

                            <button
                                className="submit-btn"
                                onClick={
                                    addProduct
                                }
                            >
                                Add Product
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    setShowAdd(false)
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
                UPDATE MODAL
            ===================================================== */}

            {showUpdate && (

                <div className="modal">

                    <div className="modal-content">

                        <h2>
                            PUT – Update Product
                        </h2>

                        <div className="form-group">

                            <label>
                                Product ID
                            </label>

                            <input
                                type="number"
                                value={
                                    updateId
                                }
                                onChange={(e) =>
                                    setUpdateId(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Product Name
                            </label>

                            <input
                                type="text"
                                value={
                                    updateProductName
                                }
                                onChange={(e) =>
                                    setUpdateProductName(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                value={
                                    updateDescription
                                }
                                onChange={(e) =>
                                    setUpdateDescription(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Price
                            </label>

                            <input
                                type="number"
                                value={
                                    updatePrice
                                }
                                onChange={(e) =>
                                    setUpdatePrice(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                value={
                                    updateQuantity
                                }
                                onChange={(e) =>
                                    setUpdateQuantity(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="modal-buttons">

                            <button
                                className="submit-btn"
                                onClick={
                                    updateProduct
                                }
                            >
                                Update Product
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    setShowUpdate(false)
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
                DELETE MODAL
            ===================================================== */}

            {showDelete && (

                <div className="modal">

                    <div className="modal-content">

                        <h2>
                            DELETE – Delete Product
                        </h2>

                        <div className="form-group">

                            <label>
                                Product ID
                            </label>

                            <input
                                type="number"
                                value={
                                    deleteId
                                }
                                onChange={(e) =>
                                    setDeleteId(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="modal-buttons">

                            <button
                                className="delete-confirm"
                                onClick={
                                    deleteProduct
                                }
                            >
                                Delete Product
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    setShowDelete(false)
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default App;