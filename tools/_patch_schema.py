import json
p = 'lib/leafschema.json'
d = json.load(open(p))
sc = d['schema']

def f(num, typ, repeated=False, tname=None):
    e = {"number": num, "type": typ, "repeated": repeated}
    if tname:
        e["type_name"] = tname
    return e

G = ".leaf.v1."
sc["leaf.v1.GiveawayStep"] = {"network": f(1, "string"), "format": f(2, "string"), "points": f(3, "int32")}
sc["leaf.v1.GiveawayStatus"] = {
    "has_event": f(1, "bool"), "event_id": f(2, "int32"), "title": f(3, "string"),
    "starts_at_ms": f(4, "int64"), "ends_at_ms": f(5, "int64"), "server_now_ms": f(6, "int64"),
    "points": f(7, "int32"), "cycles": f(8, "int32"), "step": f(9, "int32"),
    "break_until_ms": f(10, "int64"), "cooldown_until_ms": f(11, "int64"), "boost_cycles": f(12, "int32"),
    "rank": f(13, "int32"), "participants": f(14, "int32"), "reset_price": f(15, "int64"), "boost_price": f(16, "int64"),
    "resets_left": f(17, "int32"), "boosts_left": f(18, "int32"), "elite": f(19, "bool"), "elite_cycles": f(20, "int32"),
    "steps": f(21, "message", True, G + "GiveawayStep"), "break_after_step": f(22, "int32"),
}
sc["leaf.v1.GiveawayStatusRequest"] = {}
sc["leaf.v1.GiveawayStartAdRequest"] = {}
sc["leaf.v1.GiveawayStartAdResponse"] = {"token": f(1, "string"), "step": f(2, "int32"), "network": f(3, "string"), "format": f(4, "string"), "unit": f(5, "string")}
sc["leaf.v1.GiveawayCompleteAdRequest"] = {"token": f(1, "string"), "ads_shown": f(2, "int32"), "ads_clicked": f(3, "int32")}
sc["leaf.v1.GiveawayCompleteAdResponse"] = {"points_added": f(1, "int32"), "cycle_done": f(2, "bool"), "elite_unlocked": f(3, "bool"), "status": f(4, "message", False, G + "GiveawayStatus")}
sc["leaf.v1.GiveawayLeaderboardRequest"] = {}
sc["leaf.v1.GiveawayLeaderRow"] = {"rank": f(1, "int32"), "name": f(2, "string"), "points": f(3, "int32"), "me": f(4, "bool")}
sc["leaf.v1.GiveawayLeaderboardResponse"] = {"rows": f(1, "message", True, G + "GiveawayLeaderRow"), "my_rank": f(2, "int32"), "my_points": f(3, "int32"), "participants": f(4, "int32")}
sc["leaf.v1.GiveawayBuyRequest"] = {"kind": f(1, "string")}
sc["leaf.v1.GiveawayBuyResponse"] = {"balance": f(1, "int64"), "status": f(2, "message", False, G + "GiveawayStatus")}

d['services']['leaf.v1.GiveawayService'] = {
    "Status": {"request": "leaf.v1.GiveawayStatusRequest", "response": "leaf.v1.GiveawayStatus"},
    "StartAd": {"request": "leaf.v1.GiveawayStartAdRequest", "response": "leaf.v1.GiveawayStartAdResponse"},
    "CompleteAd": {"request": "leaf.v1.GiveawayCompleteAdRequest", "response": "leaf.v1.GiveawayCompleteAdResponse"},
    "Leaderboard": {"request": "leaf.v1.GiveawayLeaderboardRequest", "response": "leaf.v1.GiveawayLeaderboardResponse"},
    "Buy": {"request": "leaf.v1.GiveawayBuyRequest", "response": "leaf.v1.GiveawayBuyResponse"},
}
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False)
print('schema keys with Giveaway:', len([k for k in sc if 'Giveaway' in k]))
print('services:', list(d['services'].keys()))
