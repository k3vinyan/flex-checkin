# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
import requests
from bs4 import BeautifulSoup
from models import Driver
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

# Create your views here.
@csrf_exempt
def update(request):

    if request.method == 'POST':
        req = json.loads(request.body)
        print "--------------------------------------------------"
        print req['id']
        print "--------------------------------------------------"
        

        if req['type'] == 'checkin':
            if req['boolean'] == True:
                driver = Driver.objects.get(DPID=req['id'])
                driver.isCheckin = True;
                driver.isNoShow = False;
                driver.save(update_fields=["isCheckin"])
                driver.save(update_fields=["isNoShow"])
            else:
                driver = Driver.objects.get(DPID=req['id'])
                driver.isCheckin = False;
                driver.isNoShow = True;
                driver.save(update_fields=["isCheckin"])
                driver.save(update_fields=["isNoShow"])
        elif req['type'] == 'noShow':
            if req['boolean'] == True:
                driver = Driver.objects.get(DPID=req['id'])
                driver.isCheckin = False;
                driver.isNoShow = True;
                driver.save(update_fields=["isCheckin"])
                driver.save(update_fields=["isNoShow"])
            else:
                driver = Driver.objects.get(DPID=req['id'])
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
        print "well hello there"
        req = json.loads(request.body)
        print req
        for driver in req:
            try:
                Driver.objects.get(DPID=driver['id'])
            except ObjectDoesNotExist:
                name = driver['name'].split(" ");
                fullName = driver['name']
                firstName = name[0]
                lastName = name[1]
                id = driver['id']
                startTime = driver['startTime']
                endTime = driver['endTime']
                blockTime = driver['blockTime']
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
                            endTime = endTime)
                d.save()

        data = serializers.serialize("json", Driver.objects.all())

        return HttpResponse(data)
