import os


def export_vars(request):
    data = {}
    if "DEV" in os.environ:
        data["DEV"] = os.environ["DEV"]
    else:
        data["DEV"] = False
        
    if "CMS" in os.environ:
        data["CMS"] = os.environ["CMS"]
    else:
        data["CMS"] = False
    return data
