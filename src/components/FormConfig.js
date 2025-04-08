const FormConfig = {
  login: [
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      validation: { required: true, pattern: /.+@.+\..+/ },
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      placeholder: "Enter your password",
      validation: { required: true, minLength: 6 },
    },
  ],
};

export default FormConfig;
