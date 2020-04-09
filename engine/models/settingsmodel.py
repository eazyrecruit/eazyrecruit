from models.basemodel import BaseModel
from helpers.utilities import decrypt_node_encoded_data
class SettingsModel(BaseModel):

    def __init__(self):
            super().__init__()
            
    def getImapSettings(self):
        db = super().EazyrecruitDB()
        imapSettings = db.companysettings.find({'group':'imap'})
        return self.getSettings(imapSettings)

    def getSettings(self, settings):
        if settings:
            companySettings = {}
            for setting in settings:
                companySettings[setting['key']] = decrypt_node_encoded_data(setting['value'])
            return companySettings
        else:
            return null