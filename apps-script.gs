function getWishSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Wishes') || spreadsheet.getSheets()[0];
  const headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];

  const required = ['id', 'name', 'message', 'time', 'ownerToken'];
  required.forEach((header) => {
    if (!headers.includes(header)) {
      const nextColumn = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextColumn).setValue(header);
    }
  });

  return sheet;
}

function outputJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const sheet = getWishSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return outputJson([]);

  const headers = values.shift().map((header) => String(header).trim());
  const wishes = values
    .filter((row) => row[headers.indexOf('id')])
    .map((row) => ({
      id: String(row[headers.indexOf('id')] || ''),
      name: String(row[headers.indexOf('name')] || ''),
      message: String(row[headers.indexOf('message')] || ''),
      time: String(row[headers.indexOf('time')] || '')
    }));

  return outputJson(wishes);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = getWishSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map((header) => String(header).trim());

  if (data.action === 'add') {
    const id = `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ownerToken = String(data.ownerToken || '');
    const row = new Array(sheet.getLastColumn()).fill('');
    row[headers.indexOf('id')] = id;
    row[headers.indexOf('name')] = data.name || '';
    row[headers.indexOf('message')] = data.message || '';
    row[headers.indexOf('time')] = data.time || '';
    row[headers.indexOf('ownerToken')] = ownerToken;
    sheet.appendRow(row);
    return outputJson({ status: 'success', id: id });
  }

  const idIndex = headers.indexOf('id');
  const messageIndex = headers.indexOf('message');
  const ownerTokenIndex = headers.indexOf('ownerToken');
  const rowIndex = values.findIndex((row) => String(row[idIndex]) === String(data.id));

  if (rowIndex < 0) {
    return outputJson({ status: 'error', message: 'لم يتم العثور على التهنئة' });
  }

  if (data.action === 'delete') {
    // تم استبدال قراءة كلمة المرور من إعدادات السكريبت بالرقم المطلوب مباشرة
    const adminPassword = '01551946625';
    if (!adminPassword || String(data.password || '') !== adminPassword) {
      return outputJson({ status: 'error', message: 'كلمة مرور المشرف غير صحيحة' });
    }

    sheet.deleteRow(rowIndex + 2);
    return outputJson({ status: 'success' });
  }

  if (data.action === 'edit') {
    const rowOwnerToken = String(values[rowIndex][ownerTokenIndex] || '');
    if (!rowOwnerToken || rowOwnerToken !== String(data.ownerToken || '')) {
      return outputJson({ status: 'error', message: 'لا يمكنك تعديل هذه التهنئة' });
    }

    sheet.getRange(rowIndex + 2, messageIndex + 1).setValue(String(data.message || '').trim());
    return outputJson({ status: 'success' });
  }

  return outputJson({ status: 'error', message: 'إجراء غير مدعوم' });
}