const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./quan-ly-chi-tieu-421003-ed917161454e.json");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file", // note that sharing-related calls require the google drive scope
];

const jwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: SCOPES,
});

// sheet template
const template = new GoogleSpreadsheet(
  // "1Zqvtd0Usx6bqkEOOsZb26h-bDMMhpqxuwJjwMUKIFf0",
  "1lEj9UZX96G8JENi4vySsYid-wbIfiX5Z1ZraHnd7hQ8",
  jwt
);
// template.loadInfo()
const info = async () => {
  await template.loadInfo();
};

var templateSheetsAmount = 0;

info()
  .then(() => {
    templateSheetsAmount = template.sheetCount;
    // console.log("Số lượng sheet:", templateSheetsAmount);
  })
  .catch((error) => {
    console.log("Đã xảy ra lỗi:", error);
  });
// tạo file cho 1 người dùng
const createNewSheet = async (userMails) => {
  console.log("userMails", userMails);
  // tạo file mới
  const newDoc = await GoogleSpreadsheet.createNewSpreadsheetDocument(jwt, {
    title: "Quan ly chi tieu",
  });
  newDoc.loadInfo();

  // copy template sheets vào file mới
  for (let i = 0; i < templateSheetsAmount; i++) {
    const z = await template.sheetsByIndex[i].copyToSpreadsheet(
      newDoc.spreadsheetId
    );
  }

  // // rename sheet từ "bản sao của ..." -> "..."
  const duplicatedDoc = new GoogleSpreadsheet(newDoc.spreadsheetId, jwt);
  await duplicatedDoc.loadInfo();
  for (let i = 1; i < templateSheetsAmount + 1; i++) {
    const name = duplicatedDoc.sheetsByIndex[i].title.replace("Copy of ", "");
    duplicatedDoc.sheetsByIndex[i].updateProperties({ title: name });
  }

  //xoa sheet dau tien
  const sheet1 = duplicatedDoc.sheetsByIndex[0];
  await sheet1.delete();

  // share quyền cho user

  await Promise.all(
    userMails.map(async (mail) => {
      await newDoc.share(mail);
    })
  );
  const link = `https://docs.google.com/spreadsheets/d/${newDoc.spreadsheetId}`;
  return link;
};

// tạo file cho nhóm
const createNewSheetForGroup = async (userMails) => {
  // tạo file mới
  const newDoc = await GoogleSpreadsheet.createNewSpreadsheetDocument(jwt, {
    title: "Quan ly chi tieu",
  });
  newDoc.loadInfo();

  // copy template sheets vào file mới
  for (let i = 0; i < templateSheetsAmount; i++) {
    const z = await template.sheetsByIndex[i].copyToSpreadsheet(
      newDoc.spreadsheetId
    );
  }

  // rename sheet từ "bản sao của ..." -> "..."
  const duplicatedDoc = new GoogleSpreadsheet(newDoc.spreadsheetId, jwt);
  await duplicatedDoc.loadInfo();
  for (let i = 1; i < templateSheetsAmount + 1; i++) {
    const name = duplicatedDoc.sheetsByIndex[i].title.replace("Copy of ", "");
    duplicatedDoc.sheetsByIndex[i].updateProperties({ title: name });
  }

  //xoa sheet dau tien
  const sheet1 = duplicatedDoc.sheetsByIndex[0];
  await sheet1.delete();

  // share quyền cho user

  for (const mail of userMails) {
    await newDoc.share(mail);
  }
  const link = `https://docs.google.com/spreadsheets/d/${newDoc.spreadsheetId}`;
  return link;
};

const getTime = () => {
  var currentTime = new Date();
  var day = currentTime.getDate();
  var month = currentTime.getMonth() + 1; // Tháng bắt đầu từ 0, nên cộng 1
  var year = currentTime.getFullYear();

  // Định dạng ngày, tháng và năm thành chuỗi "dd/mm/yyyy"
  // var formattedDay = day < 10 ? "0" + day : day;
  var formattedDay = day;
  // var formattedMonth = month < 10 ? "0" + month : month;
  var formattedMonth = month;
  var formattedYear = year;

  // Lấy giờ, phút và giây từ đối tượng Date
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  // Định dạng lại chuỗi giờ, phút và giây thành "hh:mm:ss"
  var formattedTime =
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0");

  var formattedDate =
    formattedMonth +
    "/" +
    formattedDay +
    "/" +
    formattedYear +
    " " +
    formattedTime;
  return formattedDate;
};

const convertStringToNumber = (input) => {
  // Sử dụng regex để kiểm tra và bắt nhóm số và chữ cái cuối cùng
  const regex = /^(\d+(\.\d+)?)([kK]|[tT][rR])?$/;
  const segments = input.match(regex);

  if (segments) {
    let numberPart = parseFloat(segments[1]);
    let suffix = segments[3];

    if (suffix) {
      if (suffix.toLowerCase() === "k") {
        return numberPart * 1000;
      } else if (suffix.toLowerCase() === "tr") {
        return numberPart * 1000000;
      }
    }

    return numberPart;
  } else {
    console.log("Invalid input format");
  }
};

const writeGGSheet = async (mention, category, remainingData, sheetLink) => {
  console.log(mention, category, remainingData, sheetLink);
  let money;
  let note = "";
  // Bước 2: Tách chuỗi thành hai phần dựa trên khoảng trắng đầu tiên

  const firstSpaceIndex = remainingData.indexOf(" ");
  if (firstSpaceIndex === -1) {
    money = convertStringToNumber(remainingData);
    note = "";
  } else {
    money = convertStringToNumber(remainingData.substring(0, firstSpaceIndex));
    note = remainingData.substring(firstSpaceIndex + 1);
  }

  // lấy sheetId
  let sheetId = "";
  const regex = /\/d\/([a-zA-Z0-9-_]+)(?:\/|$)/;
  const matches = sheetLink.match(regex);
  if (matches && matches[1]) {
    sheetId = matches[1];
  }

  // mở file sheet
  const file = new GoogleSpreadsheet(sheetId, jwt);
  await file.loadInfo();
  var sheet = file.sheetsByIndex[2];
  const timeDayMonthYear = getTime();

  if (mention == "chi tiêu") {
    await sheet
      .addRow({
        "Thời gian": timeDayMonthYear,
        "Hạng mục": category,
        "Số tiền": money,
        "Ghi chú": note,
      })
      .then(() => {})
      .catch((error) => {
        console.log(error);
      });
  } else if (mention == "lập kế hoạch") {
    sheet = file.sheetsByIndex[3];

    const month = `Tháng ${new Date().getMonth() + 1}`;

    await sheet
      .addRow({
        "Thời gian": timeDayMonthYear,
        "Loại thu nhập": category,
        "Số tiền": money,
        "Ghi chú": note,
      })
      .then(() => {})
      .catch((error) => {
        console.log(error);
      });
  } else if (mention == "thu nhập") {
    sheet = file.sheetsByIndex[4];
    await sheet
      .addRow({
        "Thời gian": timeDayMonthYear,
        "Loại thu nhập": category,
        "Số tiền": money,
        "Ghi chú": note,
      })
      .then(() => {})
      .catch((error) => {
        console.log(error);
      });
  } else {
    sheet = file.sheetsByIndex[5];
  }
};

const writeCategory = async (categoryName, sheetLink) => {
  const name = categoryName.trim();
  // mở file sheet
  // lấy sheetId
  let sheetId = "";
  const regex = /\/d\/([a-zA-Z0-9-_]+)(?:\/|$)/;
  const matches = sheetLink.match(regex);
  if (matches && matches[1]) {
    sheetId = matches[1];
  }

  // mở file sheet
  const file = new GoogleSpreadsheet(sheetId, jwt);
  await file.loadInfo();
  const sheet = file.sheetsByIndex[1];

  await sheet
    .addRow({
      "Thiết yếu": name,
    })
    .then(() => {
      return 1;
    })
    .catch((error) => {
      return error;
    });
};

const readTotalSpending = async (sheetLink) => {
  // lấy sheetId
  let sheetId = "";
  const regex = /\/d\/([a-zA-Z0-9-_]+)(?:\/|$)/;
  const matches = sheetLink.match(regex);
  if (matches && matches[1]) {
    sheetId = matches[1];
  }

  // mở file sheet
  const file = new GoogleSpreadsheet(sheetId, jwt);
  await file.loadInfo();
  const sheet = file.sheetsByIndex[2];
  await sheet.loadCells("L2:N2");

  const day = sheet.getCellByA1("L2").value;
  const week = sheet.getCellByA1("M2").value;
  const month = sheet.getCellByA1("N2").value;
  return { day, week, month };
};

module.exports = {
  createNewSheet,
  createNewSheetForGroup,
  convertStringToNumber,
  writeGGSheet,
  writeCategory,
  readTotalSpending,
};
