// ================================
// MOBILE MENU
// ================================

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

menuToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");

    if (navMenu.classList.contains("active")) {
        menuToggle.textContent = "✕";
        menuToggle.setAttribute("aria-label", "Close navigation menu");
    } else {
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    }
});


// ================================
// CLOSE MOBILE MENU AFTER CLICK
// ================================

const navLinks = document.querySelectorAll(".nav-menu a");

navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
});


// ================================
// CONTACT FORM
// ================================

const form = document.querySelector("#contactForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const subject = form.elements["subject"].value.trim();
    const message = form.elements["message"].value.trim();

    // Check empty fields
    if (
        name === "" ||
        email === "" ||
        subject === "" ||
        message === ""
    ) {
        alert("Please fill in all fields.");
        return;
    }

    // Check email
    if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
    }

    try {

        const response = await fetch(
            "https://nexaforge-production.up.railway.app/api/contact",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            alert("Thank you! Your message has been sent.");

            form.reset();

        } else {

            alert(
                data.message ||
                "Something went wrong. Please try again."
            );

        }

    } catch (error) {

        console.error("Contact form error:", error);

        alert("Unable to connect to the server.");

    }

});