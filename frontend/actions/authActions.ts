import {
  LOGIN_URL,
  REGISTER_URL,
  VERIFY_EMAIL_URL,
  ADMIN_LOGIN_AS_USER_URL,
} from "@/constants/UrlConstants";
import axios from "axios";

export const registerUserAction = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(REGISTER_URL, {
      username,
      email,
      password,
    });
    if (response.status === 201) {
      return {
        status: true,
        message: response.data.message,
      };
    } else {
      return {
        status: false,
      };
    }
  } catch (error: unknown) {
    console.log("Error in registerUserAction:", error);
    let errorMessage = "An error occurred";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "An error occurred";
    }
    return {
      status: false,
      message: errorMessage,
    };
  }
};

export const verifyEmailAction = async (token: string) => {
  try {
    const response = await axios.get(`${VERIFY_EMAIL_URL}/${token}`);
    if (response.status === 200) {
      return {
        status: true,
        message: response.data.message,
      };
    } else {
      return {
        status: false,
        message: response.data.message,
      };
    }
  } catch (error: unknown) {
    console.log("Error in verifyEmailAction:", error);
    let errorMessage = "An error occurred";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "An error occurred";
    }
    return {
      status: false,
      message: errorMessage,
    };
  }
};

export const loginUserAction = async (email: string, password: string) => {
  try {
    const response = await axios.post(LOGIN_URL, {
      email,
      password,
    });

    if (response.status === 200) {
      return {
        status: true,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user,
      };
    } else {
      return {
        status: false,
        message: response.data.message,
      };
    }
  } catch (error: unknown) {
    console.log("Error in loginUserAction:", error);
    let errorMessage = "An error occurred";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "An error occurred";
    }
    return {
      status: false,
      message: errorMessage,
    };
  }
};

export const adminLoginAsUserAction = async (
  adminEmail: string,
  adminPassword: string,
  targetUserId: string
) => {
  try {
    const response = await axios.post(ADMIN_LOGIN_AS_USER_URL, {
      email: adminEmail,
      password: adminPassword,
      targetUserId,
    });

    if (response.status === 200) {
      return {
        status: true,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user,
      };
    } else {
      return {
        status: false,
        message: response.data.message,
      };
    }
  } catch (error: unknown) {
    console.log("Error in adminLoginAsUserAction:", error);
    let errorMessage = "An error occurred";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "An error occurred";
    }
    return {
      status: false,
      message: errorMessage,
    };
  }
};
