# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
import requests
from bs4 import BeautifulSoup
from models import Driver
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

# Create your views here.
@csrf_exempt
def unplannedRoute(request):

    driversData = {}
    req = json.loads(request.body)

    reqHour, reqMin = json.loads(request.body)['time'].split(":")
    reqHour = int(reqHour)
    if request.method == 'POST':
        drivers = Driver.objects.all()
        currentTime = ""
        counter = 0
        for driver in drivers:

            time, period = driver.startTime.split(" ")
            hour, min = time.split(":")
            if period == 'pm' and hour != '12':
                hour = int(hour) + 12

            if int(reqHour) <= int(hour):
                if currentTime != driver.startTime:
                    currentTime = driver.startTime;
                    try:
                        driversData[counter] = block
                        counter += 1
                    except NameError:
                        print "first block error"
                    militaryTime = str(hour) + ":" + min
                    #old file
                    #block = {'startTime': militaryTime, 'accepted': 1, 'isCheckin': 0, 'isNoShow': 0}
                    block = {'blockTime': driver.startTime + " - " + driver.endTime, 'shiftLength': driver.shiftLength, 'accepted': 1, 'isCheckin': 0, 'isNoShow': 0}

                    if driver.isCheckin == True:
                        block['isCheckin'] += 1
                    if driver.isNoShow == True:
                        block['isNoShow'] += 1
                else:
                    block['accepted'] += 1
                    if driver.isCheckin == True:
                        block['isCheckin'] += 1
                    if driver.isNoShow == True:
                        block['isNoShow'] += 1

    driversData['counter'] = counter
    return JsonResponse(driversData)

@csrf_exempt
def update(request):

    if request.method == 'POST':
        req = json.loads(request.body)

        if req['type'] == 'checkin':
            if req['boolean'] == True:
                d = Driver.objects.get(DPID=req['id'])
                time = req['startTime'] + " " + req['period']
                driver = Driver.objects.get(DPID=req['id'], startTime=time)
                driver.isCheckin = True;
                driver.isNoShow = False;
                driver.save(update_fields=["isCheckin"])
                driver.save(update_fields=["isNoShow"])
            else:
                driver = Driver.objects.get(DPID=req['id'], startTime=time)
                driver.isCheckin = False;
                driver.isNoShow = True;
                driver.save(update_fields=["isCheckin"])
                driver.save(update_fields=["isNoShow"])
        elif req['type'] == 'noShow':
            if req['boolean'] == True:
                driver = Driver.objects.get(DPID=req['id'], startTime=time)
                driver.isCheckin = False;
                driver.isNoShow = True;
                driver.save(update_fields=["isCheckin"])
                driver.save(update_fields=["isNoShow"])
            else:
                driver = Driver.objects.get(DPID=req['id'], startTime=time)
                driver.isCheckin = True;
                driver.isNoShow = False;
                driver.save(update_fields=["isCheckin"])
                driver.save(update_fields=["isNoShow"])


        data = Driver.objects.all()
        return HttpResponse(data)

@csrf_exempt
def index(request):
    if request.method == 'GET':
        data = serializers.serialize("json", Driver.objects.all())

        return HttpResponse(data, content_type='application/json')

    if request.method == 'POST':

        req = json.loads(request.body)

        for driver in req:
            try:
                d = Driver.objects.get(DPID=driver['id'], startTime=driver['startTime'])
            except ObjectDoesNotExist:
                name = driver['name'].split(" ");
                fullName = driver['name']
                firstName = name[0]
                lastName = name[1]
                id = driver['id']
                startTime = driver['startTime']
                endTime = driver['endTime']
                blockTime = driver['blockTime']
                shiftLength = driver['shiftLength']
                isNoShow = False
                isCheckin = False
                isCheckout = False
                checkinTime = None

                d = Driver( DPID=id,
                            fullName = fullName,
                            firstName = firstName,
                            lastName = lastName,
                            blockTime = blockTime,
                            startTime = startTime,
                            isCheckin = isCheckin,
                            isCheckout = isCheckout,
                            isNoShow = isNoShow,
                            checkinTime = checkinTime,
                            shiftLength = shiftLength,
                            endTime = endTime)
                d.save()

        data = serializers.serialize("json", Driver.objects.all())

        return HttpResponse(data)
