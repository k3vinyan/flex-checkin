# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
class Driver(models.Model):
    DPID        = models.CharField(max_length=20, default=False)
    fullName    = models.CharField(max_length=40, blank=True)
    firstName   = models.CharField(max_length=20)
    lastName    = models.CharField(max_length=30)
    isCheckin   = models.BooleanField(default=False)
    blockTime   = models.CharField(max_length=20, blank=True)
    startTime   = models.CharField(max_length=10, blank=True)
    endTime     = models.CharField(max_length=10, blank=True)
    isNoShow    = models.BooleanField(blank=True)
    isCheckout  = models.BooleanField(default=False)
    shiftLength = models.CharField(max_length=20, null=True)
    checkinTime = models.CharField(max_length=20, blank=True, null=True)
    create_at   = models.DateTimeField(auto_now_add=True, null=True)

    # def __str__(self):
    #     return self.firstName + " " + self.lastName

    class Meta:
        ordering = ('startTime', 'firstName',)
