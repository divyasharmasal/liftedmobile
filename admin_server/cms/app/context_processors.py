import os


def export_vars(request):
    data = {}
    if "DEV" in os.environ:
        data["DEV"] = os.environ["DEV"]
    else:
        data["DEV"] = False
    return data
